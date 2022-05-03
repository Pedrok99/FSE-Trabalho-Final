import { Flex, Text } from '@chakra-ui/react'
import { IconType } from 'react-icons'

interface IInfoLineProps {
  InfoIcon?: IconType
  InfoIconColor?: string
  InfoIconClass?: string
  label: string
  value?: string
  UpdateComponent?: React.ReactElement
}

function InfoLine({
  InfoIcon,
  InfoIconColor,
  InfoIconClass,
  label,
  value,
  UpdateComponent
}: IInfoLineProps) {
  return (
    <Flex justify="space-between">
      <Flex alignItems="center" gap={1}>
        {InfoIcon && (
          <InfoIcon size={20} color={InfoIconColor} className={InfoIconClass} />
        )}
        {label}
      </Flex>
      {value && !UpdateComponent && <Text>{value}</Text>}
      {UpdateComponent || null}
    </Flex>
  )
}

export default InfoLine
