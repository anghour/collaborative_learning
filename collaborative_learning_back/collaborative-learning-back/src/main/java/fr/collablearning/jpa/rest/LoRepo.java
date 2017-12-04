package fr.collablearning.jpa.rest;

import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import fr.collablearning.jpa.entities.LO;

@RepositoryRestResource(collectionResourceRel = "lo", path = "lo")
public interface LoRepo extends AbstractBaseDao<LO, Long> {
	
}