export default function FullpagePopup(props) {
  const Content = props.content;
  const className = ["fullpage-popup", "unstyled", props.className]
    .filter(Boolean)
    .join(" ");

  return (
    <aside className={className} id={props.id}>
      {props.children ?? (Content ? <Content onClose={props.onClose} /> : null)}
    </aside>
  );
}
