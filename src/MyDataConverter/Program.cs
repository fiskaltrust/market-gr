using System.Text;
using System.Text.Json;
using System.Xml;
using System.Xml.Serialization;
using MyDataConverter;

if (args.Length == 1 && File.Exists(args[0]))
{
    var fileXml = File.ReadAllText(args[0]);
    Console.Write(ConvertToJson(fileXml));
    return 0;
}

if (Console.IsInputRedirected)
{
    var stdinXml = Console.In.ReadToEnd();
    Console.Write(ConvertToJson(stdinXml));
    return 0;
}

PrintBanner();

while (true)
{
    Console.WriteLine();
    Console.WriteLine("Paste the MyData InvoicesDoc XML below and finish with a line containing only 'EOF' (or press Ctrl+Z then Enter on Windows). Type 'quit' to exit.");
    Console.WriteLine();

    var sb = new StringBuilder();
    string? line;
    while ((line = Console.ReadLine()) != null)
    {
        if (line.Trim().Equals("quit", StringComparison.OrdinalIgnoreCase) ||
            line.Trim().Equals("exit", StringComparison.OrdinalIgnoreCase))
        {
            return 0;
        }

        if (line.Trim().Equals("EOF", StringComparison.OrdinalIgnoreCase))
        {
            break;
        }

        sb.AppendLine(line);
    }

    var xml = sb.ToString().Trim();
    if (string.IsNullOrWhiteSpace(xml))
    {
        Console.WriteLine("(no input)");
        continue;
    }

    Console.WriteLine();
    Console.WriteLine("=== ReceiptRequest(s) ===");
    Console.WriteLine();
    try
    {
        Console.WriteLine(ConvertToJson(xml));
    }
    catch (Exception ex)
    {
        Console.ForegroundColor = ConsoleColor.Red;
        Console.WriteLine("Conversion failed: " + ex.Message);
        Console.ResetColor();
    }
}

static string ConvertToJson(string xml)
{
    var doc = ParseInvoicesDoc(xml);
    if (doc.invoice == null || doc.invoice.Length == 0)
    {
        return "// no invoices found";
    }

    var receipts = doc.invoice.Select(InvoiceConverter.Convert).ToArray();
    var jsonOptions = new JsonSerializerOptions
    {
        WriteIndented = true,
        DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull,
    };
    return receipts.Length == 1
        ? JsonSerializer.Serialize(receipts[0], jsonOptions)
        : JsonSerializer.Serialize(receipts, jsonOptions);
}

static InvoicesDoc ParseInvoicesDoc(string xml)
{
    var serializer = new XmlSerializer(typeof(InvoicesDoc));
    using var reader = XmlReader.Create(new StringReader(xml), new XmlReaderSettings
    {
        IgnoreWhitespace = true,
    });
    var result = (InvoicesDoc?) serializer.Deserialize(reader);
    if (result == null)
    {
        throw new InvalidOperationException("Failed to parse XML as InvoicesDoc.");
    }
    return result;
}

static void PrintBanner()
{
    Console.WriteLine("MyData InvoicesDoc -> fiskaltrust.Middleware ReceiptRequest converter");
    Console.WriteLine("=====================================================================");
    Console.WriteLine();
    Console.WriteLine("Usage:");
    Console.WriteLine("  MyDataConverter <path/to/invoice.xml>      # convert from a file");
    Console.WriteLine("  cat invoice.xml | MyDataConverter          # read from stdin");
    Console.WriteLine("  MyDataConverter                            # interactive paste mode (this)");
}
