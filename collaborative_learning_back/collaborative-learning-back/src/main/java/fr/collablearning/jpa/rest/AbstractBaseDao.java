package fr.collablearning.jpa.rest;

import java.io.Serializable;

import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.PagingAndSortingRepository;

@NoRepositoryBean
interface AbstractBaseDao<T, ID extends Serializable> extends PagingAndSortingRepository<T, ID> {

	//T findById(ID id);
	
	//List<T> findAll();

	//void delete(T deleted);
}