import "./panel.css"
export function Panel({ children }: { children: React.ReactNode }) {
  return <div className="panel">{children}</div>
}
