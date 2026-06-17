package com.horseracing.controllers;

import com.horseracing.entities.User;
import com.horseracing.entities.Wallet;
import com.horseracing.entities.WalletTransaction;
import com.horseracing.repositories.UserRepository;
import com.horseracing.repositories.WalletRepository;
import com.horseracing.repositories.WalletTransactionRepository;

// OpenPDF specific imports (no wildcard)
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

// Apache POI specific imports (no wildcard)
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@Slf4j
public class ReportExportController {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;

    @GetMapping("/pdf/wallet-transactions")
    public ResponseEntity<byte[]> exportTransactionsPdf(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Wallet wallet = walletRepository.findByUserId(user.getId()).orElse(null);
        if (wallet == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        List<WalletTransaction> transactions = walletTransactionRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getId());

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);
            document.open();

            // Document Header
            com.lowagie.text.Font titleFont = com.lowagie.text.FontFactory.getFont(com.lowagie.text.FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph("LICH SU GIAO DICH VI DIEN TU\n(E-WALLET TRANSACTION HISTORY)", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph(" "));

            // Metadata info
            document.add(new Paragraph("Khach hang (Customer): " + user.getFullName()));
            document.add(new Paragraph("Email: " + user.getEmail()));
            document.add(new Paragraph("So du hien tai (Current Balance): " + wallet.getBalance() + " VND"));
            document.add(new Paragraph("Ngay xuat bao cao (Export Date): " + LocalDateTime.now()));
            document.add(new Paragraph(" "));

            // Create Table
            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            
            // Header Row
            table.addCell("ID");
            table.addCell("Loai giao dich (Type)");
            table.addCell("So tien (Amount)");
            table.addCell("Trang thai (Status)");
            table.addCell("Ngay tao (Created Date)");

            // Populate Rows
            for (WalletTransaction tx : transactions) {
                table.addCell(String.valueOf(tx.getId()));
                table.addCell(tx.getTransactionType());
                table.addCell(tx.getAmount() != null ? tx.getAmount().toString() + " VND" : "0 VND");
                table.addCell(tx.getStatus());
                table.addCell(tx.getCreatedAt() != null ? tx.getCreatedAt().toString() : "N/A");
            }

            document.add(table);
            document.close();

            byte[] contents = out.toByteArray();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "wallet_transactions_" + user.getId() + ".pdf");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return new ResponseEntity<>(contents, headers, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error generating transaction PDF report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/excel/wallet-transactions")
    public ResponseEntity<byte[]> exportTransactionsExcel(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Wallet wallet = walletRepository.findByUserId(user.getId()).orElse(null);
        if (wallet == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        List<WalletTransaction> transactions = walletTransactionRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getId());

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Transactions");

            // Title block
            org.apache.poi.ss.usermodel.Row titleRow = sheet.createRow(0);
            org.apache.poi.ss.usermodel.Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("LICH SU GIAO DICH VI DIEN TU (E-WALLET TRANSACTION HISTORY)");
            
            org.apache.poi.ss.usermodel.Row infoRow1 = sheet.createRow(2);
            infoRow1.createCell(0).setCellValue("Khach hang (Customer):");
            infoRow1.createCell(1).setCellValue(user.getFullName());
            
            org.apache.poi.ss.usermodel.Row infoRow2 = sheet.createRow(3);
            infoRow2.createCell(0).setCellValue("Email:");
            infoRow2.createCell(1).setCellValue(user.getEmail());

            org.apache.poi.ss.usermodel.Row infoRow3 = sheet.createRow(4);
            infoRow3.createCell(0).setCellValue("So du hien tai (Balance):");
            infoRow3.createCell(1).setCellValue(wallet.getBalance().doubleValue());

            // Header row
            org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(6);
            String[] columns = {"Transaction ID", "Type", "Amount (VND)", "Status", "Created Date"};
            
            // Header style
            CellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            for (int i = 0; i < columns.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data rows
            int rowNum = 7;
            for (WalletTransaction tx : transactions) {
                org.apache.poi.ss.usermodel.Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(tx.getId());
                row.createCell(1).setCellValue(tx.getTransactionType());
                row.createCell(2).setCellValue(tx.getAmount() != null ? tx.getAmount().doubleValue() : 0.0);
                row.createCell(3).setCellValue(tx.getStatus());
                row.createCell(4).setCellValue(tx.getCreatedAt() != null ? tx.getCreatedAt().toString() : "N/A");
            }

            // Autosize columns
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            byte[] contents = out.toByteArray();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", "wallet_transactions_" + user.getId() + ".xlsx");

            return new ResponseEntity<>(contents, headers, HttpStatus.OK);
        } catch (IOException e) {
            log.error("Error generating transaction Excel report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated() && authentication.getPrincipal() instanceof UserDetails) {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            return userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        }
        return null;
    }
}
