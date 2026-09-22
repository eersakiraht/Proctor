package com.proctor.exam.controller;

import com.proctor.exam.dto.*;
import com.proctor.exam.service.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminProctoringController {

    private final ProctoringSessionService sessionService;
    private final ProctoringEventService eventService;
    private final RiskEngine riskEngine;
    private final AdminDashboardService dashboardService;
    private final ReportExportService reportExportService;
    private final AuditLogService auditLogService;

    public AdminProctoringController(ProctoringSessionService sessionService,
                                     ProctoringEventService eventService,
                                     RiskEngine riskEngine,
                                     AdminDashboardService dashboardService,
                                     ReportExportService reportExportService,
                                     AuditLogService auditLogService) {
        this.sessionService = sessionService;
        this.eventService = eventService;
        this.riskEngine = riskEngine;
        this.dashboardService = dashboardService;
        this.reportExportService = reportExportService;
        this.auditLogService = auditLogService;
    }

    @GetMapping("/dashboard/summary")
    public DashboardSummaryResponse getDashboardSummary() {
        return dashboardService.getSummary();
    }

    @GetMapping("/dashboard/stats")
    public DashboardStatsResponse getDashboardStats() {
        return dashboardService.getStats();
    }

    @GetMapping("/dashboard/charts")
    public DashboardChartsResponse getDashboardCharts(@RequestParam(required = false) Long examId) {
        return dashboardService.getCharts(examId);
    }

    /**
     * Lists attempts for an exam with scores, risk score, flagged status, and severity-aggregated event counts.
     * Feeds the admin Results table in ExamDetail. Supports filtering.
     */
    @GetMapping("/exams/{examId}/attempts")
    public List<AdminAttemptSummaryResponse> getExamAttempts(
            @PathVariable Long examId,
            @RequestParam(required = false) String eventType,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) String studentEmail,
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) Instant to) {
        return eventService.getAttemptsWithEventSummary(examId, studentEmail, severity, eventType, from, to);
    }

    /**
     * Real-time proctoring session status for a specific attempt.
     */
    @GetMapping("/exams/{examId}/attempts/{attemptId}/proctoring-session")
    public ProctoringSessionResponse getProctoringSession(@PathVariable Long examId,
                                                         @PathVariable Long attemptId) {
        return sessionService.getSessionForAdmin(examId, attemptId);
    }

    /**
     * Full, filterable proctoring event timeline for an attempt.
     */
    @GetMapping("/attempts/{attemptId}/events")
    public List<ProctoringEventResponse> getAttemptEvents(@PathVariable Long attemptId,
                                                         @RequestParam(required = false) String severity,
                                                         @RequestParam(required = false) String type) {
        return eventService.getEventsForAttempt(attemptId, severity, type);
    }

    /**
     * Time-decayed risk timeline, warning history, and flagged status for an attempt.
     */
    @GetMapping("/attempts/{attemptId}/risk-timeline")
    public RiskTimelineResponse getRiskTimeline(@PathVariable Long attemptId) {
        return riskEngine.getRiskTimeline(attemptId);
    }

    /**
     * Full single-attempt report view and event timeline.
     */
    @GetMapping({"/attempts/{attemptId}/report", "/reports/attempts/{attemptId}"})
    public AdminAttemptReportResponse getAttemptReport(@PathVariable Long attemptId) {
        return reportExportService.buildReport(attemptId);
    }

    /**
     * Export attempt proctoring report as CSV, Excel, or PDF.
     */
    @GetMapping("/attempts/{attemptId}/report/export")
    public ResponseEntity<byte[]> exportAttemptReport(
            @PathVariable Long attemptId,
            @RequestParam(defaultValue = "pdf") String format,
            Authentication authentication) throws IOException {

        String adminEmail = authentication != null ? authentication.getName() : "admin";
        auditLogService.logAdmin(adminEmail, "EXPORT_REPORT",
                "Exported attempt " + attemptId + " report as " + format.toUpperCase());

        byte[] bytes;
        String contentType;
        String filename;

        switch (format.toLowerCase()) {
            case "csv" -> {
                bytes = reportExportService.exportCsv(attemptId);
                contentType = "text/csv; charset=UTF-8";
                filename = "attempt-" + attemptId + "-report.csv";
            }
            case "excel", "xlsx" -> {
                bytes = reportExportService.exportExcel(attemptId);
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                filename = "attempt-" + attemptId + "-report.xlsx";
            }
            case "pdf" -> {
                bytes = reportExportService.exportPdf(attemptId);
                contentType = MediaType.APPLICATION_PDF_VALUE;
                filename = "attempt-" + attemptId + "-report.pdf";
            }
            default -> throw new IllegalArgumentException("Unsupported format: " + format);
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .body(bytes);
    }
}
