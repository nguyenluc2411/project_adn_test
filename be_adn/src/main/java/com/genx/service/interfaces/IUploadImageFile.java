package com.genx.service.interfaces;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface IUploadImageFile {

    String uploadImageFile(MultipartFile file) throws IOException;

}
