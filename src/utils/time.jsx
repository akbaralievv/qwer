// eslint-disable-next-line
export default function Timestamp() {
  const date = new Date();
  // eslint-disable-next-line
  const day = date.getDate();
  // eslint-disable-next-line
  const year = date.getFullYear();
  // eslint-disable-next-line
  const mount = date.getMonth();
  // eslint-disable-next-line
  const formattedTime = `${day}.${mount+1}.${year}`;
  return <>{formattedTime}</>;
}
