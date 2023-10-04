type Attributes = {
  [key: string]: string;
};

export async function ttml2srt(url: string, forceFps: number | null) {
  const data = await fetch(url);
  const srtText = convert(await data.text(), forceFps);
  const srtBlob = new Blob([srtText], { type: "text/plain" });
  const srtUrl = URL.createObjectURL(srtBlob);
  return { srtUrl, srtText };
}

function convert(data: string, forceFps: number | null) {
  const FPSnumMatch = data.match(/ttp:frameRate="(\d+)"/);
  const FPSmulMatch = data.match(/ttp:frameRateMultiplier="(\d+) (\d+)"/);
  const FPSnum = FPSnumMatch ? parseInt(FPSnumMatch[1], 10) : 0; // numerator
  const FPSmul = FPSmulMatch ? parseInt(FPSmulMatch[1], 10) : 1; // multiplier
  const FPSden = FPSmulMatch ? parseInt(FPSmulMatch[2], 10) : 1; // denominator
  let frameRate = (FPSnum * FPSmul) / FPSden;
  frameRate = forceFps ?? frameRate;

  if (!Number.isInteger(frameRate)) {
    frameRate = parseFloat(frameRate.toFixed(3));
  }

  const FPSsfrMatch = data.match(/ttp:frameRate="ttp:subFrameRate="(\d+)"/);
  const subFrameRate = FPSsfrMatch ? parseInt(FPSsfrMatch[1], 10) : 1;
  const tickRateMatch = data.match(/ttp:tickRate="(\d+)"/);
  const tickRate = tickRateMatch ? parseInt(tickRateMatch[1], 10) : 1;

  const fRateMsg =
    frameRate > 0 ? frameRate : "UNKNOWN\n[WARN] TIMING MAY BE INCORRECT";
  console.info(`[INFO] FRAMERATE IS ${fRateMsg}`);

  let outSrt = "";
  let str_id = 0;
  let ptime = "",
    ctime = "";

  const regex = new RegExp("<p (.*?)>(.*?)</p>", "g");
  let match: RegExpExecArray | null;

  while ((match = regex.exec(data)) !== null) {
    const [_, attributeStr, textContent] = match;

    const atts: Attributes = attributeStr
      .trim()
      .match(/[^\s]*="?[^"]*/g)!
      .map((x) => x.split("="))
      .reduce((acc, [key, value]) => {
        acc[key] = (value || "").replace(/^"/, "");
        return acc;
      }, {} as Attributes);

    if (!atts.begin || !atts.end) {
      console.warn(
        "[WARN] Some string was not parsed, start/end time attribute was missing!"
      );
      continue;
    }

    const begin = formatSrtTime(atts.begin, frameRate, subFrameRate, tickRate);
    const end = formatSrtTime(atts.end, frameRate, subFrameRate, tickRate);
    const text = textContent
      .replace(/<\/br>/g, "")
      .replace(/&apos;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/<span>(.*?)<\/span>/g, "$1")
      .replace(/(<br.*?>)+/g, "\r\n")
      .replace(/<[^>]*\/>/g, "")
      .replace(/<(\S*?) (.*?)>(.*?)<\/.*?>/g, fontRepl);

    if (text.trim() !== "") {
      ctime = `${begin} --> ${end}`;
      if (ptime !== ctime) {
        ptime = ctime;
        str_id++;
        if (outSrt !== "") {
          outSrt += "\r\n\r\n";
        }
        outSrt += `${str_id}\r\n${ctime}\r\n`;
      } else {
        outSrt += "\r\n";
      }
      outSrt += text;
    }
  }

  outSrt += "\r\n\r\n";
  return `\uFEFF${outSrt}`;
}
function formatSrtTime(
  time: string,
  frameRate: number,
  subFrameRate: number,
  tickRate: number
): string {
  let t = time.match(/(\d*:\d*:\d*)(.*)$/);
  if (!t) {
    t = time.match(/([0-9.]*)(.*)/);
    const mult: { [key: string]: number } = {
      h: 3600, // hours
      m: 60, // minutes
      s: 1, // seconds
      ms: 0.001, // milliseconds
      f: 1 / frameRate, // frames
      t: 1 / tickRate, // ticks
    };
    let seconds: number = parseFloat(t![1]) * mult[t![2] || ""];
    let h: string = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    let m: string = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    let s: string = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    let ms: string = Math.round((seconds - Math.floor(seconds)) * 1000)
      .toString()
      .padEnd(3, "0")
      .slice(0, 3);
    return `${h}:${m}:${s},${ms}`;
  }
  let f: string = t[2] || "";
  if (f.length === 0) {
    return `${t[1]},000`;
  }
  if (f[0] === ".") {
    let ms: string = f.slice(1).padEnd(3, "0").slice(0, 3);
    return `${t[1]},${ms}`;
  }
  if (f[0] === ":") {
    let fa: string[] = f.slice(1).split(".");
    let frames: number = parseInt(fa[0]);
    if (fa.length > 1) {
      frames += parseInt(fa[1]) / subFrameRate;
    }
    let ms: string = Math.floor((frames * 1000) / frameRate)
      .toString()
      .padEnd(3, "0")
      .slice(0, 3);
    return `${t[1]},${ms}`;
  }
  // invalid time
  return `${t[1]},000`;
}
type TextStyle = {
  fontStyle?: string;
  textDecoration?: string;
  fontWeight?: string;
  color?: string;
};

function fontRepl(
  str: string,
  tag: string,
  attrs: string,
  txt: string
): string {
  if (tag !== "span") {
    return txt;
  }
  const at: string[] = attrs
    .replace(/\s*=\s*/g, "=")
    .split(" ")
    .filter((x) => x.trim());

  const styleObj: TextStyle = {};

  for (const a of at) {
    let ax: RegExpMatchArray | null;

    if ((ax = a.match(/tts:color="(.*?)"/))) {
      styleObj.color = ax[1];
      continue;
    }
    switch (a) {
      case 'tts:fontStyle="italic"':
        styleObj.fontStyle = "italic";
        break;
      case 'tts:textDecoration="underline"':
        styleObj.textDecoration = "underline";
        break;
      case 'tts:fontWeight="bold"':
        styleObj.fontWeight = "bold";
        break;
    }
  }

  if (styleObj.color) {
    txt = `<font color="${styleObj.color}">${txt.trim()}</font>`;
  }
  if (styleObj.fontStyle) {
    txt = `<i>${txt.trim()}</i>`;
  }
  if (styleObj.textDecoration) {
    txt = `<u>${txt.trim()}</u>`;
  }
  if (styleObj.fontWeight) {
    txt = `<b>${txt.trim()}</b>`;
  }

  return txt;
}

export function srtToHtml(srt: string): string {
  const srtLines: string[] = srt.split("\n");

  let html: string = "";
  let inDialogue: boolean = false;

  srtLines.forEach((line: string) => {
    const trimmedLine: string = line.trim();

    if (!trimmedLine) {
      if (inDialogue) {
        html += "</p>";
        inDialogue = false;
      }
    } else if (trimmedLine.match(/-->/)) {
      if (!inDialogue) {
        html += "<p>";
        inDialogue = true;
      }

      // Optionally add timestamps into HTML as a span (you can omit this block if not needed)
      html += `<span class="timestamp">${trimmedLine}</span>`;
    } else if (!isNaN(parseInt(trimmedLine))) {
      // Line numbers, ignore
    } else {
      // Dialogue line
      html += `<span class="dialogue">${trimmedLine}</span>`;
    }
  });

  // Close the last paragraph if it's still open
  if (inDialogue) {
    html += "</p>";
  }

  return html;
}
