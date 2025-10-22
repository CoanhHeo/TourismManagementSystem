package com.example.travel.service;

import com.example.travel.entity.TourType;
import com.example.travel.repository.TourTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service xử lý nghiệp vụ cho Tour Type
 * 
 * Chức năng:
 * - Lấy danh sách tất cả loại tour
 * - Lấy chi tiết loại tour theo ID
 * - Tạo mới loại tour
 * - Cập nhật thông tin loại tour
 * - Xóa loại tour
 */
@Service
public class TourTypeService {

    @Autowired
    private TourTypeRepository tourTypeRepository;

    /**
     * Lấy tất cả loại tour
     * 
     * @return List<TourType> danh sách tất cả loại tour
     */
    public List<TourType> getAllTourTypes() {
        return tourTypeRepository.findAll();
    }

    /**
     * Lấy loại tour theo ID
     * 
     * @param id ID của loại tour
     * @return Optional<TourType> loại tour nếu tìm thấy
     */
    public Optional<TourType> getTourTypeById(Integer id) {
        return tourTypeRepository.findById(id);
    }

    /**
     * Tạo mới loại tour
     * 
     * @param tourType Thông tin loại tour cần tạo
     * @return TourType loại tour đã được tạo
     * @throws RuntimeException nếu tên loại tour đã tồn tại
     */
    @Transactional
    public TourType createTourType(TourType tourType) {
        // Validate tên loại tour không được rỗng
        if (tourType.getTourTypeName() == null || tourType.getTourTypeName().trim().isEmpty()) {
            throw new RuntimeException("Tên loại tour không được để trống");
        }

        return tourTypeRepository.save(tourType);
    }

    /**
     * Cập nhật thông tin loại tour
     * 
     * @param id ID của loại tour cần cập nhật
     * @param tourTypeDetails Thông tin mới của loại tour
     * @return TourType loại tour đã được cập nhật
     * @throws RuntimeException nếu không tìm thấy loại tour
     */
    @Transactional
    public TourType updateTourType(Integer id, TourType tourTypeDetails) {
        TourType tourType = tourTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy loại tour với ID: " + id));

        // Validate tên loại tour
        if (tourTypeDetails.getTourTypeName() != null && !tourTypeDetails.getTourTypeName().trim().isEmpty()) {
            tourType.setTourTypeName(tourTypeDetails.getTourTypeName());
        }

        return tourTypeRepository.save(tourType);
    }

    /**
     * Xóa loại tour
     * 
     * @param id ID của loại tour cần xóa
     * @throws RuntimeException nếu không tìm thấy loại tour
     */
    @Transactional
    public void deleteTourType(Integer id) {
        TourType tourType = tourTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy loại tour với ID: " + id));

        // Xóa loại tour
        // Lưu ý: Nếu có tours đang sử dụng loại tour này, database sẽ báo lỗi foreign key constraint
        tourTypeRepository.delete(tourType);
    }
}
