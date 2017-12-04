package fr.collablearning.jpa.entities;

import java.util.List;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;

@Entity
public class QuizAnswer extends AbstractBaseEntity<Long> {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;
	
	@OneToOne
	private Excercice question;
	
	@OneToMany
	private List<Answer> answers;

	@Override
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}
	
	public boolean isCorrect() {
		if(answers == null) {
			return false;
		}
		for (Answer answer : answers) {
			if(!answer.isCorrect()) {
				return false;
			}
		}
		return true;
	}
}
