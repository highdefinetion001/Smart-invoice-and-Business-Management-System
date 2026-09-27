package com.invoice.management.service;

import com.invoice.management.model.Material;
import com.invoice.management.repository.MaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MaterialService {

    private final MaterialRepository materialRepository;

    public List<Material> getAllMaterials() {
        return materialRepository.findAll();
    }

    public List<Material> getActiveMaterials() {
        return materialRepository.findByIsActiveTrue();
    }

    public Material getMaterialById(Long id) {
        return materialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Material not found with id: " + id));
    }

    public Material createMaterial(Material material) {
        if (materialRepository.existsByCode(material.getCode())) {
            throw new RuntimeException("Material code already exists: " + material.getCode());
        }
        return materialRepository.save(material);
    }

    public Material updateMaterial(Long id, Material materialDetails) {
        Material material = getMaterialById(id);
        material.setName(materialDetails.getName());
        material.setCode(materialDetails.getCode());
        material.setRate(materialDetails.getRate());
        material.setUnit(materialDetails.getUnit());
        material.setCalculationType(materialDetails.getCalculationType());
        material.setDescription(materialDetails.getDescription());
        material.setIsActive(materialDetails.getIsActive());
        return materialRepository.save(material);
    }

    public void deleteMaterial(Long id) {
        materialRepository.deleteById(id);
    }

    public List<Material> searchMaterials(String query) {
        return materialRepository.findByNameContainingIgnoreCaseOrCodeContainingIgnoreCase(query, query);
    }
}
