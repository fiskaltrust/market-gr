using System.Reflection;
using System.Xml;
using System.Xml.Schema;

namespace MyDataConverter;

public enum ValidationSeverity { Warning, Error }

public sealed record ValidationIssue(ValidationSeverity Severity, int LineNumber, int LinePosition, string Message);

/// <summary>
/// Validates a candidate myDATA InvoicesDoc XML document against the AADE
/// v1.0.12 XSD schemas vendored in <c>Scheme/</c>. The schema set is loaded
/// once from embedded resources and reused.
/// </summary>
public static class XmlValidator
{
    private const string ResourcePrefix = "MyDataConverter.Scheme.";

    private static readonly Lazy<XmlSchemaSet> SchemaSet = new(LoadSchemas);

    public static IReadOnlyList<ValidationIssue> Validate(string xml)
    {
        if (string.IsNullOrWhiteSpace(xml))
        {
            return new[] { new ValidationIssue(ValidationSeverity.Error, 0, 0, "Document is empty.") };
        }

        var issues = new List<ValidationIssue>();
        var settings = new XmlReaderSettings
        {
            ValidationType = ValidationType.Schema,
            Schemas = SchemaSet.Value,
            ValidationFlags = XmlSchemaValidationFlags.ProcessInlineSchema
                              | XmlSchemaValidationFlags.ProcessSchemaLocation
                              | XmlSchemaValidationFlags.ReportValidationWarnings,
        };
        settings.ValidationEventHandler += (_, e) =>
        {
            issues.Add(new ValidationIssue(
                e.Severity == XmlSeverityType.Warning ? ValidationSeverity.Warning : ValidationSeverity.Error,
                e.Exception?.LineNumber ?? 0,
                e.Exception?.LinePosition ?? 0,
                e.Message));
        };

        try
        {
            using var reader = XmlReader.Create(new StringReader(xml), settings);
            while (reader.Read())
            {
                // Drain the reader so the validator fires for every node.
            }
        }
        catch (XmlException ex)
        {
            issues.Add(new ValidationIssue(ValidationSeverity.Error, ex.LineNumber, ex.LinePosition, ex.Message));
        }

        return issues;
    }

    private static XmlSchemaSet LoadSchemas()
    {
        var set = new XmlSchemaSet { XmlResolver = new EmbeddedResourceResolver() };
        // Only register the top-level schemas — <xs:include> and <xs:import>
        // directives inside them are resolved via EmbeddedResourceResolver.
        set.Add("http://www.aade.gr/myDATA/invoice/v1.0", "InvoicesDoc-v1.0.12.xsd");
        set.Add("https://www.aade.gr/myDATA/incomeClassificaton/v1.0", "incomeClassification-v1.0.12.xsd");
        set.Add("https://www.aade.gr/myDATA/expensesClassificaton/v1.0", "expensesClassification-v1.0.12.xsd");
        set.Compile();
        return set;
    }

    private sealed class EmbeddedResourceResolver : XmlUrlResolver
    {
        private const string Scheme = "embedded";

        public override Uri ResolveUri(Uri? baseUri, string? relativeUri)
        {
            // Schema imports/includes use plain file names (e.g.
            // "SimpleTypes-v1.0.12.xsd"). Encode them in a synthetic Uri whose
            // OriginalString contains the file name so GetEntity can recover it
            // unmodified — Uri's host parsing would otherwise lowercase or
            // mangle the file name.
            if (!string.IsNullOrEmpty(relativeUri) && !relativeUri!.Contains("://"))
            {
                return new Uri($"{Scheme}:///{Uri.EscapeDataString(relativeUri)}", UriKind.Absolute);
            }
            return base.ResolveUri(baseUri, relativeUri);
        }

        public override object GetEntity(Uri absoluteUri, string? role, Type? ofObjectToReturn)
        {
            if (absoluteUri.Scheme == Scheme)
            {
                var fileName = Uri.UnescapeDataString(absoluteUri.AbsolutePath.TrimStart('/'));
                var resourceName = ResourcePrefix + fileName;
                var stream = typeof(XmlValidator).Assembly.GetManifestResourceStream(resourceName)
                    ?? throw new InvalidOperationException($"Embedded XSD '{fileName}' not found (looking for resource '{resourceName}').");
                return stream;
            }
            return base.GetEntity(absoluteUri, role, ofObjectToReturn);
        }
    }
}
