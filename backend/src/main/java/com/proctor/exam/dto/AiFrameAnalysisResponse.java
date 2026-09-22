package com.proctor.exam.dto;

import java.util.List;
import java.util.Map;

public record AiFrameAnalysisResponse(
        boolean faceDetected,
        int faceCount,
        double confidence,
        boolean phoneDetected,
        String gazeDirection,
        HeadPoseDto headPose,
        List<Map<String, Object>> events,
        String modelVersion
) {
    public record HeadPoseDto(double yaw, double pitch, double roll) {}
}
