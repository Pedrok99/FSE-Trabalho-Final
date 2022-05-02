import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'

import { IEspInfo } from '../../types/ESPTypes'

interface IAddFormProps {
  addEspInfo: (espInfo: IEspInfo) => void
  onClose: () => void
}

function AddForm({ addEspInfo, onClose }: IAddFormProps) {
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting }
  } = useForm<IEspInfo>()

  const onSubmit = (data: IEspInfo) => {
    addEspInfo(data)
    onClose()
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormControl isInvalid={!!errors.name}>
        <Box mb={4}>
          <FormLabel htmlFor="espId">ESP32 ID</FormLabel>
          <Input
            type="text"
            placeholder="MAC_ADRESS da ESP"
            id="espId"
            {...register('espId', {
              required: 'Campo obrigatório'
            })}
          />
          <FormErrorMessage>
            {errors.espId && errors.espId.message}
          </FormErrorMessage>
        </Box>
        <Flex justifyContent="space-between" gap={10}>
          <Box mb={4} w="100%">
            <FormLabel htmlFor="name">Nome da ESP32</FormLabel>
            <Input
              type="text"
              id="name"
              {...register('name', {
                required: 'Campo obrigatório'
              })}
            />
            <FormErrorMessage>
              {errors.name && errors.name.message}
            </FormErrorMessage>
          </Box>

          <Box mb={4} w="100%">
            <FormLabel htmlFor="room">Cômodo</FormLabel>
            <Input
              type="text"
              id="room"
              {...register('room', {
                required: 'Campo obrigatório'
              })}
            />
            <FormErrorMessage>
              {errors.room && errors.room.message}
            </FormErrorMessage>
          </Box>
        </Flex>
      </FormControl>
      <Box textAlign="right">
        <Button
          colorScheme="green"
          color="white"
          type="submit"
          isLoading={isSubmitting}
          loadingText="Adicionando..."
        >
          Adicionar
        </Button>
      </Box>
    </form>
  )
}

export default AddForm
