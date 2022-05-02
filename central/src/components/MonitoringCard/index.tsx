import { Box, Center, Flex, Text } from '@chakra-ui/react'

import { IEspInfo, IEspStatus } from '../../types/ESPTypes'
import Status from '../Status'

export interface IMonitoringCardProps {
  espInfo: IEspInfo
  espStatus: IEspStatus
}

function MonitoringCard({ espInfo, espStatus }: IMonitoringCardProps) {
  return (
    <Box borderWidth="1px" borderRadius="lg" borderColor="gray.200" shadow="md">
      <Flex
        justifyContent="space-between"
        borderBottom="1px"
        borderColor="gray.200"
        p={3}
      >
        <Text>Cômodo: {espInfo.room}</Text>
        <Status status={espStatus.status} />
      </Flex>

      <Flex justifyContent="space-between" p={3} h="20">
        <Text>{espInfo.name}</Text>
        <Text>{espInfo.espId}</Text>
      </Flex>
    </Box>
  )
}

export default MonitoringCard
