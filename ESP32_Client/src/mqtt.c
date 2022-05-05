#include <stdio.h>
#include <stdint.h>
#include <stddef.h>
#include <string.h>
#include "esp_system.h"
#include "esp_event.h"
#include "esp_netif.h"

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/semphr.h"
#include "freertos/queue.h"

#include "lwip/sockets.h"
#include "lwip/dns.h"
#include "lwip/netdb.h"
#include "esp_log.h"
#include "mqtt_client.h"

#include "led.h"
#include "cJSON.h"
#include "mqtt.h"

#include "memory_data.h"
#include <nvs_component.h>

#define TAG "MQTT"

extern xSemaphoreHandle conexaoMQTTSemaphore;
extern xSemaphoreHandle initialMQTTSemaphore;
esp_mqtt_client_handle_t client;

static esp_err_t mqtt_event_handler_cb(esp_mqtt_event_handle_t event)
{
    esp_mqtt_client_handle_t client = event->client;
    int msg_id;

    // get mac
    uint8_t mac[6];
    esp_read_mac(mac, ESP_MAC_WIFI_STA);

    // convert mac to string
    char mac_str[18];
    sprintf(mac_str, "%02x:%02x:%02x:%02x:%02x:%02x", mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
    ESP_LOGI(TAG, "MAC: %s", mac_str);

    switch (event->event_id)
    {
    case MQTT_EVENT_CONNECTED:
        ESP_LOGI(TAG, "MQTT_EVENT_CONNECTED");
        // xSemaphoreTake(conexaoMQTTSemaphore, portMAX_DELAY);

        memory_data_t *memory_data = malloc(sizeof(memory_data_t));
        strcpy(memory_data->room, "\0");
        strcpy(memory_data->input, "\0");
        strcpy(memory_data->output, "\0");
        memory_data->temperature = 0;

        read_struct("DATA", &memory_data, sizeof(memory_data_t));

        ESP_LOGI(TAG, "Room: %s", memory_data->room);
        ESP_LOGI(TAG, "Input: %s", memory_data->input);
        ESP_LOGI(TAG, "Output: %s", memory_data->output);
        ESP_LOGI(TAG, "TEMPERATURE: %d", memory_data->temperature);
        // xSemaphoreGive(initialMQTTSemaphore);

        char config_topic[255];
        // fse2021/<matricula>/dispositivos/<ID_do_dispositivo>
        sprintf(config_topic, "/%s/%s/dispositivos/%s", CONFIG_ESP_ROOT_TOPIC, CONFIG_ESP_MATRICULA, mac_str);

        if (strcmp(memory_data->room, "\0") != 0)
        {
            ESP_LOGI(TAG, "Room: %s", memory_data->room);
            char data[255];
            sprintf(data, "{\"mode\": \"re-register\", \"mac\": \"%s\", \"battery\": %d, \"room\": \"%s\", \"input\": \"%s\", \"output\": \"%s\", \"temperature\": %d}", mac_str, CONFIG_LOW_POWER_MODE, memory_data->room, memory_data->input, memory_data->output, memory_data->temperature);
            msg_id = esp_mqtt_client_publish(client, config_topic, data, 0, 1, 0);
            ESP_LOGI(TAG, "sent publish to %s, msg_id=%d", config_topic, msg_id);
        }
        else
        {
            char data[255];
            sprintf(data, "{\"mode\": \"register\", \"mac\": \"%s\", \"battery\": %d}", mac_str, CONFIG_LOW_POWER_MODE);
            msg_id = esp_mqtt_client_publish(client, config_topic, data, 0, 1, 0);
            ESP_LOGI(TAG, "sent publish to %s, msg_id=%d", config_topic, msg_id);
        }

        msg_id = esp_mqtt_client_subscribe(client, config_topic, 0);
        ESP_LOGI(TAG, "Subscribed to %s, msg_id=%d", config_topic, msg_id);

        xSemaphoreGive(conexaoMQTTSemaphore);
        break;

    case MQTT_EVENT_DISCONNECTED:
        ESP_LOGI(TAG, "MQTT_EVENT_DISCONNECTED");
        break;

    case MQTT_EVENT_SUBSCRIBED:
        ESP_LOGI(TAG, "MQTT_EVENT_SUBSCRIBED, msg_id=%d", event->msg_id);
        msg_id = esp_mqtt_client_publish(client, "/topic/qos0", "data", 0, 0, 0);
        ESP_LOGI(TAG, "sent publish successful, msg_id=%d", msg_id);
        break;
    case MQTT_EVENT_UNSUBSCRIBED:
        ESP_LOGI(TAG, "MQTT_EVENT_UNSUBSCRIBED, msg_id=%d", event->msg_id);
        break;
    case MQTT_EVENT_PUBLISHED:
        ESP_LOGI(TAG, "MQTT_EVENT_PUBLISHED, msg_id=%d", event->msg_id);
        break;

    case MQTT_EVENT_DATA:
        ESP_LOGI(TAG, "MQTT_EVENT_DATA_TRIGGERED");

        ESP_LOGI(TAG, "TOPIC=%.*s", event->topic_len, event->topic);
        ESP_LOGI(TAG, "DATA=%.*s", event->data_len, event->data);
        event->data[event->data_len] = '\0';

        cJSON *config = cJSON_Parse(event->data);

        cJSON *mode = cJSON_GetObjectItem(config, "mode");
        char mode_value[20];
        strcpy(mode_value, mode->valuestring);
        ESP_LOGI(TAG, "mode: %s", mode_value);

        if (strcmp(mode_value, "register") == 0)
        {
            cJSON *room = cJSON_GetObjectItem(config, "room");
            cJSON *input = cJSON_GetObjectItem(config, "input");
            cJSON *output = cJSON_GetObjectItem(config, "output");
            cJSON *temperature = cJSON_GetObjectItem(config, "temperature");

            memory_data_t *tmp_data = malloc(sizeof(memory_data_t));

            strcpy(tmp_data->room, room->valuestring);
            strcpy(tmp_data->input, input->valuestring);
            strcpy(tmp_data->output, output->valuestring);
            tmp_data->temperature = temperature->valueint;

            ESP_LOGI(TAG, "ROOM: %s", tmp_data->room);
            ESP_LOGI(TAG, "INPUT: %s", tmp_data->input);
            ESP_LOGI(TAG, "OUTPUT: %s", tmp_data->output);
            ESP_LOGI(TAG, "TEMPERATURE: %d", tmp_data->temperature);

            write_struct("DATA", tmp_data, sizeof(memory_data_t));
            xSemaphoreGive(initialMQTTSemaphore);
        }
        else if (strcmp(mode_value, "update") == 0)
        {
            int state = cJSON_GetObjectItem(config, "state")->valueint;
            ESP_LOGI(TAG, "State: %d", state);
            set_led_state(state);
        }
        vTaskDelay(1000 / portTICK_PERIOD_MS);

        break;

    case MQTT_EVENT_ERROR:
        ESP_LOGI(TAG, "MQTT_EVENT_ERROR");
        break;

    default:
        ESP_LOGI(TAG, "Other event id:%d", event->event_id);
        break;
    }
    return ESP_OK;
}

static void mqtt_event_handler(void *handler_args, esp_event_base_t base, int32_t event_id, void *event_data)
{
    ESP_LOGD(TAG, "Event dispatched from event loop base=%s, event_id=%d", base, event_id);
    mqtt_event_handler_cb(event_data);
}

void mqtt_start()
{

    esp_mqtt_client_config_t mqtt_config = {
        // .uri = "mqtt://mqtt.eclipse.org",
        .uri = "mqtt://broker.hivemq.com",
    };

    //   esp_mqtt_client_handle_t client = esp_mqtt_client_init(&mqtt_config);
    client = esp_mqtt_client_init(&mqtt_config);
    esp_mqtt_client_register_event(client, ESP_EVENT_ANY_ID, mqtt_event_handler, client);
    esp_mqtt_client_start(client);
}

void mqtt_envia_mensagem(char *topico, char *mensagem)
{
    int message_id = esp_mqtt_client_publish(client, topico, mensagem, 0, 1, 0);
    ESP_LOGI(TAG, "Mesnagem enviada, ID: %d", message_id);
}
