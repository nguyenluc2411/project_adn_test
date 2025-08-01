package com.genx.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.genx.service.interfaces.IUploadImageFile;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UploadImageFileImpl implements IUploadImageFile {

    private final Cloudinary cloudinary;

    @Override
    public String uploadImageFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File không được trống.");
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null || !originalName.contains(".")) {
            throw new IllegalArgumentException("Tên file không hợp lệ.");
        }

        String[] parts = getFileNameParts(originalName);
        String fileName = parts[0];
        String extension = parts[1];
        String publicId = UUID.randomUUID() + "_" + fileName;

        log.info("Uploading file: {} | publicId: {}", originalName, publicId);

        cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "public_id", "avatars/" + publicId,
                "overwrite", true
        ));

        String finalUrl = cloudinary.url().generate("avatars/" + publicId + "." + extension);
        log.info("File uploaded: {}", finalUrl);
        return finalUrl;
    }

    private String[] getFileNameParts(String originalName) {
        int dotIndex = originalName.lastIndexOf('.');
        String name = originalName.substring(0, dotIndex);
        String ext = originalName.substring(dotIndex + 1);
        return new String[]{name, ext};
    }
}
