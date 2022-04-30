import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button
} from '@chakra-ui/react'
import { ReactNode } from 'react'

interface IModalPros {
  children?: ReactNode
  title: string
  isOpen: boolean
  onClose: () => void
}

function AddESPModal({ children, isOpen, onClose, title }: IModalPros) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />

        <ModalBody>{children}</ModalBody>

        {/* <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Fechar
          </Button>
          <Button colorScheme="green" color="white">
            Adicionar
          </Button>
        </ModalFooter> */}
      </ModalContent>
    </Modal>
  )
}

export default AddESPModal
