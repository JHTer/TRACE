import type { PropsWithChildren } from 'react'

function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111]">
      <header className="flex items-center justify-end px-6 py-4 text-xs text-[#666666]">
        <span className="rounded border border-[#E5E5E5] bg-white px-3 py-1 font-mono">
          [ Press ⌘K to search algorithms ]
        </span>
      </header>
      <main>{children}</main>
    </div>
  )
}

export { AppShell }
