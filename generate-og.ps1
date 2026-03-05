Add-Type -AssemblyName System.Drawing
$canvasWidth = 1200
$canvasHeight = 630
$bmp = New-Object System.Drawing.Bitmap($canvasWidth, $canvasHeight)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::White)

$imgPath = "C:\Users\gram\Desktop\Dev_project\BizDive\public\BizDive_Logo_Confirm.png"
if (Test-Path $imgPath) {
    try {
        $img = [System.Drawing.Image]::FromFile($imgPath)

        # Calculate scale to fit within 1100x530 (leaving 50px margin)
        $maxWidth = 1000
        $maxHeight = 400
        $scale = 1.0

        if ($img.Width / $img.Height -gt $maxWidth / $maxHeight) {
            # Logo is wider than the target area ratio
            $scale = $maxWidth / $img.Width
        }
        else {
            # Logo is taller than the target area ratio
            $scale = $maxHeight / $img.Height
        }

        # Ensure we don't upscale if the image is already small (optional, but usually good)
        if ($scale -gt 2.0) { $scale = 2.0 }

        $targetWidth = [int]($img.Width * $scale)
        $targetHeight = [int]($img.Height * $scale)

        $x = ($canvasWidth - $targetWidth) / 2
        $y = ($canvasHeight - $targetHeight) / 2

        # High quality rendering
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        
        $g.DrawImage($img, [int]$x, [int]$y, [int]$targetWidth, [int]$targetHeight)

        $outputPath = "C:\Users\gram\Desktop\Dev_project\BizDive\src\app\opengraph-image.png"
        $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
        
        Write-Host "OG image generated successfully at $outputPath"
        Write-Host "Original: $($img.Width)x$($img.Height) -> Target: $($targetWidth)x$($targetHeight)"

        $img.Dispose()
    }
    catch {
        Write-Host "Error processing image: $_"
    }
}
else {
    Write-Host "Logo file not found at $imgPath"
}

$g.Dispose()
$bmp.Dispose()
