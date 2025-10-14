<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\File;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FileController extends Controller
{
    public function index(Request $request)
    {
        $directoryId = $request->query('directory_id');
        $files = File::with(['directory', 'uploader'])
            ->where('directory_id', $directoryId)
            ->get();
        
        return response()->json($files);
    }

    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:102400', // 100MB
            'directory_id' => 'required|exists:directories,id',
        ]);

        $uploadedFile = $request->file('file');
        $filename = time() . '_' . $uploadedFile->getClientOriginalName();
        $path = $uploadedFile->storeAs('uploads', $filename, 'public');

        $file = File::create([
            'name' => $filename,
            'original_name' => $uploadedFile->getClientOriginalName(),
            'directory_id' => $request->directory_id,
            'uploaded_by' => auth()->id(),
            'file_path' => $path,
            'mime_type' => $uploadedFile->getMimeType(),
            'size' => $uploadedFile->getSize(),
        ]);

        return response()->json($file->load(['directory', 'uploader']), 201);
    }

    public function show(File $file)
    {
        return response()->json($file->load(['directory', 'uploader']));
    }

    public function update(Request $request, File $file)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $file->update(['original_name' => $request->name]);

        return response()->json($file);
    }

    public function destroy(File $file)
    {
        Storage::disk('public')->delete($file->file_path);
        $file->delete();
        
        return response()->json(['message' => '文件删除成功']);
    }

    public function download(File $file)
    {
        return Storage::disk('public')->download($file->file_path, $file->original_name);
    }
}
