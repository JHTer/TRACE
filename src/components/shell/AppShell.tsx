import type { PropsWithChildren } from 'react'

function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111]">
      <header className="flex items-center justify-between px-6 py-4 text-[18px] text-[#999999]">
        <a
          href="?"
          className="font-mono tracking-[0.14em] text-[#111111] transition-opacity duration-150 hover:opacity-70"
        >
          TRACE
        </a>
        <span className="font-mono tracking-[0.04em] text-[12px]">
          [ Press ⌘K to search and navigate ]
        </span>
      </header>
      <main>{children}</main>
    </div>
  )
}

export { AppShell }
