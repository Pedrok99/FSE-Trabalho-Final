#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "driver/gpio.h"
#include "sdkconfig.h"

#define BLINK_GPIO 2

void set_led_state(int state)
{
    gpio_pad_select_gpio(BLINK_GPIO);
    gpio_set_direction(BLINK_GPIO, GPIO_MODE_OUTPUT);

    if (state)
    {
        gpio_set_level(BLINK_GPIO, 1);
    }
    else
    {
        gpio_set_level(BLINK_GPIO, 0);
    }
}
