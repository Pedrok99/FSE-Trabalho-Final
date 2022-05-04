import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Stack,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';

import { IEspInfo } from '../../types/ESPTypes';

interface IAddFormProps {
  addEspInfo: (espInfo: IEspInfo) => void;
  onClose: () => void;
}

function AddForm({ addEspInfo, onClose }: IAddFormProps) {
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<IEspInfo>();

  const onSubmit = (data: IEspInfo) => {
    addEspInfo({
      ...data,
      status: 'off',
      temperature: 0,
      humidity: 0,
    });
    onClose();
  };
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
              required: 'Campo obrigatório',
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
                required: 'Campo obrigatório',
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
                required: 'Campo obrigatório',
              })}
            />
            <FormErrorMessage>
              {errors.room && errors.room.message}
            </FormErrorMessage>
          </Box>
        </Flex>

        <Flex justifyContent="space-between" gap={10}>
          <Box mb={4} w="100%">
            <FormLabel htmlFor="name">Nome do Input</FormLabel>
            <Input
              type="text"
              id="inputName"
              {...register('inputName', {
                required: 'Campo obrigatório',
              })}
            />
            <FormErrorMessage>
              {errors.name && errors.name.message}
            </FormErrorMessage>
          </Box>

          <Box mb={4} w="100%">
            <FormLabel htmlFor="room">Nome do Output</FormLabel>
            <Input
              type="text"
              id="outputName"
              {...register('outputName', {
                required: 'Campo obrigatório',
              })}
            />
            <FormErrorMessage>
              {errors.room && errors.room.message}
            </FormErrorMessage>
          </Box>
        </Flex>

        <Stack spacing={5} direction="row">
          <Checkbox id="hasAlarm" {...register('hasAlarm', {})}>
            Alarme
          </Checkbox>
          <Checkbox id="hasTempSensor" {...register('hasTempSensor', {})}>
            Temperatura + Humidade
          </Checkbox>
        </Stack>
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
  );
}

export default AddForm;
