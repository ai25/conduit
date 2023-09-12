export const LOG = (path: string[], ...args: any[]) => {
  const pathText = path
    .map((v, i) => '%c' + new Array(i).fill(' ').join('') + '• %c' + v)
    .join('\n')
  const pathStyles = path
    .map((v, i) => ['', 'background: lightgrey; color: black;'])
    .flat()
  console.log(pathText, ...pathStyles, ...args)
}
export const ERROR = (path: string[], ...args: any[]) => {
  const pathText = path
    .map((v, i) => '%c' + new Array(i).fill(' ').join('') + '• %c' + v)
    .join('\n')
  const pathStyles = path
    .map((v, i) => ['', 'background: lightgrey; color: black;'])
    .flat()
  console.error(pathText, ...pathStyles, ...args)
}

export const UNEXPECTED = (...args: any[]) =>
  console.error('UNEXPECTED CODE REACHED!!!', ...args)

export const NOTIMPLEMENTED = (...args: any[]) =>
  console.error('NOT IMPLMENENTED', ...args)

export default { LOG, ERROR }
