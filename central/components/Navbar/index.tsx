import {
 Button, Center, Divider, Flex, Spacer, Text 
} from '@chakra-ui/react';
import { BiMicrochip } from 'react-icons/bi';

interface INavbarProps {
  openAddModal: () => void;
}

function Navbar({ openAddModal }: INavbarProps) {
  return (
    <>
      <Flex>
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
      <Divider />
    </>
  );
}

export default Navbar;
