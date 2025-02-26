export function Button({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button onClick={onClick} className="button">
      {children}
    </button>
  )
}
