import AC from '../../assets/cards/AC.svg'
import AS from '../../assets/cards/AS.svg'
import KC from '../../assets/cards/KC.svg'
import KS from '../../assets/cards/KS.svg'
import ThreeC from '../../assets/cards/3C.svg'
import ThreeS from '../../assets/cards/3S.svg'
import FiveC from '../../assets/cards/5C.svg'
import FiveS from '../../assets/cards/5S.svg'
import SevenC from '../../assets/cards/7C.svg'
import SevenS from '../../assets/cards/7S.svg'
import NineC from '../../assets/cards/9C.svg'
import NineS from '../../assets/cards/9S.svg'

const faceSvgByCardCode: Record<string, string> = {
  AS,
  AC,
  '3S': ThreeS,
  '3C': ThreeC,
  '5S': FiveS,
  '5C': FiveC,
  '7S': SevenS,
  '7C': SevenC,
  '9S': NineS,
  '9C': NineC,
  KS,
  KC,
}

export { faceSvgByCardCode }
