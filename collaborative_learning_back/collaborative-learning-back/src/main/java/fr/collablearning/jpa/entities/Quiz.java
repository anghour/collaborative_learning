package fr.collablearning.jpa.entities;

import java.util.List;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;

@Entity
public class Quiz extends AbstractBaseEntity<Long> {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;

	@OneToOne
	private LO lo;
	
	@OneToOne
	private Learner learner;
	
	@OneToMany
	@JoinColumn(name="quiz_id")
	private List<QuizAnswer> quizAnswers;
	
	@Override
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public LO getLo() {
		return lo;
	}

	public void setLo(LO lo) {
		this.lo = lo;
	}

	public Learner getLearner() {
		return learner;
	}

	public void setLearner(Learner learner) {
		this.learner = learner;
	}

	public List<QuizAnswer> getQuizAnswers() {
		return quizAnswers;
	}

	public void setQuizAnswers(List<QuizAnswer> quizAnswers) {
		this.quizAnswers = quizAnswers;
	}

}
