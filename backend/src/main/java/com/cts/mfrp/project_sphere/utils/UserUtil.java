package com.cts.mfrp.project_sphere.utils;


import com.cts.mfrp.project_sphere.Enum.Role;
import com.cts.mfrp.project_sphere.model.User;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellBase;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class UserUtil {


    private final PasswordEncoder passwordEncoder;

    public  boolean checkExcelFormat(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType.equals("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    }

    public  List<User> convertExcelToList(InputStream is) {
        List<User> ls = new ArrayList<>();
        try {
            XSSFWorkbook workbook = new XSSFWorkbook(is);
            XSSFSheet sheet = workbook.getSheet("Sheet1");
            int rNum = 0;
            Iterator<Row> iterator = sheet.iterator();
            while (iterator.hasNext()) {
                Row row = iterator.next();
                if (rNum == 0) {
                    rNum++;
                    continue;
                }
                Iterator<Cell> cells = row.iterator();
                int cid = 0;
                User user = new User();
                while (cells.hasNext()) {
                    Cell cell = cells.next();
                    switch (cid) {
                        case 0:
                            user.setEmployeeId((long) cell.getNumericCellValue());
                            break;
                        case 1:
                            user.setRole(Role.valueOf(cell.getStringCellValue()));
                            break;
                        case 2:
                            user.setFirstName(cell.getStringCellValue());
                            break;
                        case 3:
                            user.setLastName(cell.getStringCellValue());
                            break;
                        case 4:
                            user.setEmail(cell.getStringCellValue());
                            break;
                        case 5:
                            user.setPassword(passwordEncoder.encode(cell.getStringCellValue()));
                            break;
                        case 6:
                            user.setPhoneNumber((long) cell.getNumericCellValue());
                            break;
                        case 7:
                            user.setIsActive(cell.getBooleanCellValue());
                            break;
                        default:
                            break;
                    }
                    cid++;
                }
                ls.add(user);

            }

        } catch (IOException e) {
            e.printStackTrace();
        }
        return ls;
    }
}
