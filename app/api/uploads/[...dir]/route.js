import fs from 'fs'; 
import path from 'path';
import { NextResponse } from 'next/server';

// Set cache duration to 7 days (in seconds)
const CACHE_DURATION = 60 * 60 * 24 * 7;

export async function GET(req, { params }) {
  // Properly await the params before accessing the dir property
  const { dir } = await params;
  const dirPath = dir.join("/");
  
  if (!dirPath) {
      return new NextResponse(null, { status: 500 });
  }

  // Prevent path traversal attacks
  if (dirPath.indexOf('..') >= 0) {
      return new NextResponse(null, { status: 400 });
  }

  try { 
      const filePath = path.join('public/uploads', dirPath);
      
      // Read and serve the file
      const data = fs.readFileSync(filePath, {flag:'r'});
      
      // Get file stats for ETag and Last-Modified headers
      const stats = fs.statSync(filePath);
      const etag = `"${stats.size}-${stats.mtimeMs}"`;
      const lastModified = stats.mtime.toUTCString();
      
      // Check if client has a valid cached version
      const ifNoneMatch = req.headers.get('if-none-match');
      const ifModifiedSince = req.headers.get('if-modified-since');
      
      if ((ifNoneMatch && ifNoneMatch === etag) || 
          (ifModifiedSince && new Date(ifModifiedSince) >= new Date(lastModified))) {
          // Return 304 Not Modified if client has valid cached version
          return new NextResponse(null, { 
              status: 304,
              headers: {
                  'Cache-Control': `public, max-age=${CACHE_DURATION}`,
                  'ETag': etag,
                  'Last-Modified': lastModified
              }
          });
      }
      
      // Return file with cache headers
      return new NextResponse(data, {
          status: 200,
          headers: {
              'Cache-Control': `public, max-age=${CACHE_DURATION}`,
              'ETag': etag,
              'Last-Modified': lastModified,
              'Content-Type': getContentType(filePath)
          }
      }); 
  } catch (_error) { 
      return new NextResponse(null, { status: 500 });
  }
}

// Helper function to determine content type based on file extension
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp'
  };
  
  return types[ext] || 'application/octet-stream';
}