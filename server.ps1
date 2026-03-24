# Kithademic Simple Local Server
# This script starts a basic HTTP server on port 3000 using PowerShell.
# No other installations (Node/Python) are required.

$port = 3000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Write-Host "Server started at http://localhost:$port/"
    Write-Host "Press Ctrl+C to stop."

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $path = $request.Url.LocalPath
        if ($path -eq "/") { $path = "/index.html" }
        
        $filePath = Join-Path (Get-Location) $path
        
        if (Test-Path $filePath -PathType Leaf) {
            $buffer = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $buffer.Length
            
            # Basic MIME types
            if ($filePath.EndsWith(".html")) { $response.ContentType = "text/html" }
            elseif ($filePath.EndsWith(".js")) { $response.ContentType = "application/javascript" }
            elseif ($filePath.EndsWith(".css")) { $response.ContentType = "text/css" }
            elseif ($filePath.EndsWith(".json")) { $response.ContentType = "application/json" }
            elseif ($filePath.EndsWith(".png")) { $response.ContentType = "image/png" }
            
            # Enable CORS for modules
            $response.AddHeader("Access-Control-Allow-Origin", "*")
            
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        } else {
            $response.StatusCode = 404
        }
        $response.Close()
    }
} catch {
    Write-Error $_
} finally {
    $listener.Stop()
}
