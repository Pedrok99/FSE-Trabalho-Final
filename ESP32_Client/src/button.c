#include <stdio.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/semphr.h"
#include "driver/gpio.h"
#include "sdkconfig.h"
#include "esp_log.h"
#include "button.h"
#include "mqtt.h"

#include <nvs_component.h>
#include "memory_data.h"
#include "string.h"

#define BUTTON_GPIO 0
#define TAG "BUTTON"

extern xSemaphoreHandle conexaoMQTTSemaphore;
extern xSemaphoreHandle initialMQTTSemaphore;

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

    memory_data_t *memory_data = malloc(sizeof(memory_data_t));
    strcpy(memory_data->room, "\0");
    strcpy(memory_data->input, "\0");
    strcpy(memory_data->output, "\0");

    while (1)
    {
        if (xSemaphoreTake(initialMQTTSemaphore, portMAX_DELAY))
        {
            ESP_LOGI(TAG, "MQTT CONNECTED");
            read_struct("DATA", &memory_data, sizeof(memory_data_t));
            ESP_LOGI(TAG, "Room: %s", memory_data->room);
            ESP_LOGI(TAG, "Input: %s", memory_data->input);
            ESP_LOGI(TAG, "Output: %s", memory_data->output);
            xSemaphoreGive(initialMQTTSemaphore);
            break;
        }
        vTaskDelay(200 / portTICK_PERIOD_MS);
    }
    char state_topic[100];
    sprintf(state_topic, "/%s/%s/%s/estado", CONFIG_ESP_ROOT_TOPIC, CONFIG_ESP_MATRICULA, memory_data->room);

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

                mqtt_envia_mensagem(state_topic, tmp_data);
            }
            xSemaphoreGive(conexaoMQTTSemaphore);
        }
        vTaskDelay(150 / portTICK_PERIOD_MS);
    }
}
