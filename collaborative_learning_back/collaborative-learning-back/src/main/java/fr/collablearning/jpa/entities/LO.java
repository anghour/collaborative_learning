package fr.collablearning.jpa.entities;

import java.util.List;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;

@Entity
public class LO extends AbstractBaseEntity<Long> {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;

	private String title;

	@ManyToMany
	@JoinTable(name = "lo_prerequis", inverseJoinColumns = { @JoinColumn(name = "prerequis_id") })
	private List<LO> prerequisites;
	
	@OneToMany
	@JoinColumn(name="lo_id")
	private List<Resource> resources;
	
	@OneToMany
	@JoinColumn(name="lo_id_exer")
	private List<Excercice> individualExercices;
	
	@OneToMany
	@JoinColumn(name="lo_id_prob")
	private List<Problem> collaborativeProblems;
	
	@ManyToOne
	private Training training;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public List<LO> getPrerequisites() {
		return prerequisites;
	}

	public void setPrerequisites(List<LO> prerequisites) {
		this.prerequisites = prerequisites;
	}

	public Training getTraining() {
		return training;
	}

	public void setTraining(Training training) {
		this.training = training;
	}

	public List<Resource> getResources() {
		return resources;
	}

	public void setResources(List<Resource> resources) {
		this.resources = resources;
	}

	public List<Excercice> getIndividualExercices() {
		return individualExercices;
	}

	public void setIndividualExercices(List<Excercice> individualExercices) {
		this.individualExercices = individualExercices;
	}

	public List<Problem> getCollaborativeProblems() {
		return collaborativeProblems;
	}

	public void setCollaborativeProblems(List<Problem> collaborativeProblems) {
		this.collaborativeProblems = collaborativeProblems;
	}
	
	public Long getIdentity() {
		return id;
	}
	
	public String[] getPrerequisitesArray() {
		String[] array = null;
		if(prerequisites != null) {
			array = new String[prerequisites.size()];
			for (LO lo : prerequisites) {
				array[prerequisites.indexOf(lo)] = lo.getId().toString();
			}
		}
		return array;
	}
	
//	public long[] getPrerequisitesArray2() {
//		long[] array = null;
//		if(prerequisites != null) {
//			array = new long[prerequisites.size()];
//			for (LO lo : prerequisites) {
//				array[prerequisites.indexOf(lo)] = lo.getId();
//			}
//		}
//		return array;
//	}
	
}
