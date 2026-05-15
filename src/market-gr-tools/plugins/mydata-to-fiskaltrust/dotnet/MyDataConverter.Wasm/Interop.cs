using System.Runtime.InteropServices.JavaScript;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Xml;
using System.Xml.Serialization;
using MyDataConverter;

namespace MyDataConverter.Wasm;

public partial class Interop
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        WriteIndented = true,
        DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull,
    };

    private static readonly string EmptyGuid = Guid.Empty.ToString();

    private static readonly string[] StripWhenEmpty =
    {
        "ftCashBoxID",
        "ftPosSystemId",
    };

    [JSExport]
    public static string Convert(string xml)
    {
        if (string.IsNullOrWhiteSpace(xml))
        {
            return "// no input";
        }

        var doc = ParseInvoicesDoc(xml);
        if (doc.invoice == null || doc.invoice.Length == 0)
        {
            return "// no invoices found";
        }

        var receipts = doc.invoice.Select(InvoiceConverter.Convert).ToArray();
        var nodes = receipts
            .Select(r => StripPlaceholderFields(JsonSerializer.SerializeToNode(r, JsonOptions)!))
            .ToArray();

        var output = nodes.Length == 1
            ? nodes[0]
            : (JsonNode) new JsonArray(nodes.Cast<JsonNode?>().ToArray());

        return output!.ToJsonString(JsonOptions);
    }

    /// <summary>
    /// Removes properties that are required-on-the-wire but only meaningful when
    /// the POS system fills them in (currently <c>ftCashBoxID</c> and
    /// <c>ftPosSystemId</c>). Emitting the empty GUID would mislead users into
    /// thinking the converter set them.
    /// </summary>
    private static JsonNode StripPlaceholderFields(JsonNode node)
    {
        if (node is JsonObject obj)
        {
            foreach (var key in StripWhenEmpty)
            {
                if (obj[key]?.GetValue<string>() == EmptyGuid)
                {
                    obj.Remove(key);
                }
            }
        }
        return node;
    }

    [JSExport]
    public static string Validate(string xml)
    {
        var issues = XmlValidator.Validate(xml);
        return JsonSerializer.Serialize(issues.Select(i => new
        {
            severity = i.Severity.ToString().ToLowerInvariant(),
            line = i.LineNumber,
            column = i.LinePosition,
            message = i.Message,
        }));
    }

    private static InvoicesDoc ParseInvoicesDoc(string xml)
    {
        var serializer = new XmlSerializer(typeof(InvoicesDoc));
        using var reader = XmlReader.Create(new StringReader(xml), new XmlReaderSettings
        {
            IgnoreWhitespace = true,
        });
        var result = (InvoicesDoc?) serializer.Deserialize(reader)
            ?? throw new InvalidOperationException("Failed to parse XML as InvoicesDoc.");
        return result;
    }
}
