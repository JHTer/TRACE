import type { PropsWithChildren } from 'react'

function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111]">
      <header className="flex items-center justify-end px-6 py-4 text-[11px] text-[#999999]">
        <span className="font-mono tracking-[0.04em]">
          [ Press ⌘K to search algorithms ]
        </span>
      </header>
      <main>{children}</main>
    </div>
  )
}

export { AppShell }
