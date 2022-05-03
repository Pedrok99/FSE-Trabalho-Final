import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton
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
      </ModalContent>
    </Modal>
  )
}

export default AddESPModal
