package com.genx.dto.request;

import com.genx.enums.ESampleType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class KitCodeRequest {
    private ESampleType sampleType;
    private MultipartFile fingerprintImage;
}
