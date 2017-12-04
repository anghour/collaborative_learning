package fr.collablearning.jpa.entities;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.MappedSuperclass;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.persistence.Version;

@MappedSuperclass
public abstract class AbstractBaseEntity<ID> {

	@Column(nullable = false)
	@Temporal(TemporalType.TIMESTAMP)
//	@Type(type = "org.jadira.usertype.dateandtime.joda.PersistentDateTime")
	private Date creationTime;

	@Column(nullable = false)
	@Temporal(TemporalType.TIMESTAMP)
	private Date modificationTime;

	@Version
	private long version;

	public abstract ID getId();

	public Date getCreationTime() {
		return creationTime;
	}

	public Date getModificationTime() {
		return modificationTime;
	}

	public long getVersion() {
		return version;
	}

	@PrePersist
	public void prePersist() {
//		DateTime now = DateTime.now();
		Date now = new Date();
		this.creationTime = now;
		this.modificationTime = now;
	}

	@PreUpdate
	public void preUpdate() {
		this.modificationTime = new Date();
	}
}
