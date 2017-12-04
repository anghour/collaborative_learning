package fr.collablearning.jpa.rest;

import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import fr.collablearning.jpa.entities.Training;

@RepositoryRestResource(collectionResourceRel = "training", path = "training")
public interface TrainingRepo extends AbstractBaseDao<Training, Long> {
	
}