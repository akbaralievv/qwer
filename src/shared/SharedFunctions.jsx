export function highlight(text, search) {
  if (!search) return text;
  const idx = text?.toString().toLowerCase().indexOf(search.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.toString().slice(0, idx)}
      <span style={{ background: '#ffe082', color: '#222' }}>
        {text.toString().slice(idx, idx + search.length)}
      </span>
      {text.toString().slice(idx + search.length)}
    </>
  );
}