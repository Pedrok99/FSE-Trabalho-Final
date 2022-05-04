import { Button, Center, Flex, Spacer, Text } from '@chakra-ui/react'
import { BiMicrochip } from 'react-icons/bi'

interface INavbarProps {
  openAddModal: () => void
}

function Navbar({ openAddModal }: INavbarProps) {
  return (
    <Flex bgGradient="linear-gradient(-3deg, rgba(2,0,36,1) 0%, rgba(75,75,149,0.9920343137254902) 46%, rgba(0,212,255,1) 100%)">
      <Center w="10%" h="16">
        <BiMicrochip size={30} />
        <Text ml={2}>FSE</Text>
      </Center>
      <Spacer />
      <Center w="10%">
        <Button
          colorScheme="telegram"
          size="sm"
          fontSize="sm"
          onClick={openAddModal}
        >
          Adicionar ESP32
        </Button>
      </Center>
    </Flex>
  )
}

export default Navbar
