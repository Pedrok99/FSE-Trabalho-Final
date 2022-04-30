import { Grid, GridItem, useDisclosure } from '@chakra-ui/react'
import { useState } from 'react'

import AddForm from './components/Form'
import Loading from './components/Loading'
import AddESPModal from './components/Modal'
import MonitoringCard from './components/MonitoringCard'
import Navbar from './components/Navbar'
import { IEspInfo } from './types/ESPTypes'

function App() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [ESPsInfo, setESPsInfo] = useState<IEspInfo[]>([])

  const addEspInfo = (espInfo: IEspInfo) => {
    setESPsInfo([...ESPsInfo, espInfo])
  }

  return (
    <>
      <Navbar openAddModal={onOpen} />
      {ESPsInfo.length > 0 ? (
        <Grid templateColumns="repeat(5, 1fr)" gap={6} p="10">
          {ESPsInfo.map((espInfo: IEspInfo) => (
            <GridItem key={espInfo.espId}>
              <MonitoringCard
                espStatus={{ status: 'Desconectado' }}
                espInfo={espInfo}
              />
            </GridItem>
          ))}
        </Grid>
      ) : (
        <Loading barSize="sm" title="Aguardando ESP32" />
      )}
      <AddESPModal title="Adicionar ESP" isOpen={isOpen} onClose={onClose}>
        <AddForm addEspInfo={addEspInfo} onClose={onClose} />
      </AddESPModal>
    </>
  )
}

export default App
