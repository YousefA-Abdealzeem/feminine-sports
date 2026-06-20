using System.Text;
using System.Text.Json;

namespace WomenSports.Services
{
    public class AiModerationService
    {
        private readonly HttpClient _httpClient;
        private const string SpaceUrl = "https://abdelrazek-123-hate-speech-detector.hf.space/gradio_api/call/predict";

        public AiModerationService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<(bool isHarmful, string label, double score)> AnalyzeComment(string text)
        {
            try
            {
                // Step 1: Send request
                var payload = new
                {
                    data = new[] { text }
                };

                var json = JsonSerializer.Serialize(payload);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync(SpaceUrl, content);
                var responseBody = await response.Content.ReadAsStringAsync();

                // Step 2: Get event_id
                var eventData = JsonSerializer.Deserialize<JsonElement>(responseBody);
                var eventId = eventData.GetProperty("event_id").GetString();

                // Step 3: Get result
                var resultResponse = await _httpClient.GetAsync($"{SpaceUrl}/{eventId}");
                var resultBody = await resultResponse.Content.ReadAsStringAsync();

                // Step 4: Parse result
                var lines = resultBody.Split('\n');
                string? dataLine = null;
                foreach (var line in lines)
                {
                    if (line.StartsWith("data:"))
                    {
                        dataLine = line.Substring(5).Trim();
                    }
                }

                if (dataLine == null)
                    return (false, "Clean", 0);

                var resultArray = JsonSerializer.Deserialize<JsonElement[]>(dataLine);
                if (resultArray == null || resultArray.Length < 2)
                    return (false, "Clean", 0);

                string label = resultArray[0].GetString() ?? "Clean";
                string scoreStr = resultArray[1].GetString() ?? "0%";

                // Extract number from score string
                var numStr = new string(scoreStr.Where(c => char.IsDigit(c) || c == '.').ToArray());
                double.TryParse(numStr, System.Globalization.NumberStyles.Float,
                    System.Globalization.CultureInfo.InvariantCulture, out double score);

                bool isHarmful = !label.Contains("Clean") && !label.Contains("نظيف");

                return (isHarmful, label, score);
            }
            catch
            {
                return (false, "Clean", 0);
            }
        }
    }

    public class GradioResponse
    {
        public object[] data { get; set; } = Array.Empty<object>();
    }
}