package fr.collablearning.jpa.rest;

import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import fr.collablearning.jpa.entities.Learner;

@RepositoryRestResource(collectionResourceRel = "learner", path = "learner")
public interface LearnerRepo extends PagingAndSortingRepository<Learner, Long> {

	Learner findByEmail(@Param("email") String email);

}
