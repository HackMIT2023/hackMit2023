package com.plantplot.plant_plot.repository;

import com.plantplot.plant_plot.model.Product;
import com.github.alperkurtul.firebaserealtimedatabase.annotation.FirebaseRealtimeDbRepoServiceImpl;
import org.springframework.stereotype.Repository;

@Repository
public class ProductRepository extends FirebaseRealtimeDbRepoServiceImpl<Product, String> {
}
