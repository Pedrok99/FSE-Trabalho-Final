import { Box, Progress } from '@chakra-ui/react'

interface ILoadingProps {
  title?: string
  barSize: 'sm' | 'md' | 'lg' | 'xs'
  containerSize?: 'sm' | 'md' | 'lg' | 'xs'
}

function Loading({ title, barSize, containerSize }: ILoadingProps) {
  return (
    <Box
      mx="auto"
      mt="28"
      maxW={containerSize || 'lg'}
      p={3}
      borderWidth="1px"
      borderRadius="lg"
      borderColor="gray.200"
    >
      <Progress size={barSize} isIndeterminate />
      <Box mt={2} textAlign="center">
        {title}
      </Box>
    </Box>
  )
}

export default Loading
