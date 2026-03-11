import type { DynamicProgrammingCellTone } from '../../domain/algorithms/types.ts'

const dynamicProgrammingCellToneClassName: Record<DynamicProgrammingCellTone, string> = {
  default: 'border-[#E5E5E5] bg-white text-[#111111]',
  active: 'border-[#111111] bg-[#111111] text-[#FAFAFA]',
  dependency: 'border-[#111111] bg-[#FAFAFA] text-[#111111]',
  path: 'border-[#111111] bg-[#E5E5E5] text-[#111111]',
  best: 'border-[#111111] bg-[#F1F1F1] text-[#111111]',
}

const getDynamicProgrammingCellToneClassName = (tone: DynamicProgrammingCellTone) =>
  dynamicProgrammingCellToneClassName[tone]

export { getDynamicProgrammingCellToneClassName }
