using System.Runtime.InteropServices.JavaScript;
using System.Text.Json;
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
        return receipts.Length == 1
            ? JsonSerializer.Serialize(receipts[0], JsonOptions)
            : JsonSerializer.Serialize(receipts, JsonOptions);
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
