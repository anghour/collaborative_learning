package fr.collablearning.jpa.entities;

import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

@Entity
@DiscriminatorValue("E")
public class Editor extends User {
	public Editor() {
	}
}