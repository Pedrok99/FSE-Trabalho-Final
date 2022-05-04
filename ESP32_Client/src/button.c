#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/semphr.h"
#include "driver/gpio.h"
#include "sdkconfig.h"
#include "esp_log.h"
#include "button.h"
#include "mqtt.h"

#define BUTTON_GPIO 0
#define TAG "BUTTON"
extern xSemaphoreHandle conexaoMQTTSemaphore;

void config_button(void *pvParameters)
{
    gpio_pad_select_gpio(BUTTON_GPIO);
    gpio_set_direction(BUTTON_GPIO, GPIO_MODE_INPUT);

    gpio_pulldown_en(BUTTON_GPIO);
    gpio_pullup_dis(BUTTON_GPIO);

    uint8_t mac[6];
    esp_read_mac(mac, ESP_MAC_WIFI_STA);

    // convert mac to string
    char mac_str[18];
    sprintf(mac_str, "%02x:%02x:%02x:%02x:%02x:%02x", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);

    char tmp_data[50];

    int prev_state = 1;
    int status = 0;

    while (1)
    {
        int button_state = gpio_get_level(BUTTON_GPIO);
        if (button_state != prev_state && xSemaphoreTake(conexaoMQTTSemaphore, portMAX_DELAY))
        // if (button_state != prev_state)
        {
            prev_state = button_state;
            if (button_state)
            {
                ESP_LOGI(TAG, "BUTTON RELEASED");
            }
            else
            {
                ESP_LOGI(TAG, "BUTTON PRESSED");
                status = !status;
                sprintf(tmp_data, "{\"data\": %d, \"mac\": \"%s\"}", status, mac_str);
                ESP_LOGI(TAG, "BUTTON: %d", status);

                mqtt_envia_mensagem("/fse2021/180106970/sala/estado", tmp_data);
            }
            xSemaphoreGive(conexaoMQTTSemaphore);
        }
        vTaskDelay(150 / portTICK_PERIOD_MS);
    }
}
